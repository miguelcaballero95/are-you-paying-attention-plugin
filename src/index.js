import "./index.scss";
import { TextControl, Flex, FlexBlock, FlexItem, Button, Icon, PanelBody, PanelRow } from "@wordpress/components";
import { InspectorControls, BlockControls, AlignmentToolbar, useBlockProps } from "@wordpress/block-editor";
import { ChromePicker } from "react-color";

/**
 * Lock post saving if the block is missing a correct answer
 */
(function () {
    let locked = false;

    wp.data.subscribe(function () {

        // Get all blocks of the type "my-plugin/are-you-paying-attention" that are missing a correct answer
        const results = wp.data.select("core/block-editor").getBlocks().filter(function (block) {
            return block.name == 'my-plugin/are-you-paying-attention' && block.attributes.correctAnswer == undefined;
        });

        // If there are any blocks missing a correct answer and the post isn't already locked, lock it
        if (results.length && !locked) {
            locked = true;
            wp.data.dispatch("core/editor").lockPostSaving("noanswer");
        }

        // If there are no blocks missing a correct answer and the post is locked, unlock it
        if (!results.length && locked) {
            locked = false;
            wp.data.dispatch("core/editor").unlockPostSaving("noanswer");
        }
    });
})()

// Register the block type
wp.blocks.registerBlockType("my-plugin/are-you-paying-attention", {
    // title: "Are You Paying Attention?",
    icon: "smiley",
    category: "common",
    attributes: {
        question: {
            type: "string"
        },
        answers: {
            type: "array",
            default: [""]
        },
        correctAnswer: {
            type: "number",
            default: undefined
        },
        bgColor: {
            type: "string",
            default: "#EBEBEB"
        },
        alignment: {
            type: "string",
            default: "left"
        }
    },
    description: "Give your audience a chance to prove their comprehension.",
    example: {
        attributes: {
            question: "What is my name?",
            answers: ["Name 1", "Name 2", "Name 3"],
            correctAnswer: 2,
        }
    },
    edit: EditComponent,
    save: function () {
        return null
    },
    /*
    Save data like below makes errores when it change, the solution is use deprecated funcion but it could be irritating setting too many versions
    save: function (props) {
        return (
            <h6>Today the sky is absolutely {props.attributes.skyColor} and the grass is {props.attributes.grassColor}</h6>
        )
    } 
    deprecated: [
        {
            attributes: {
                skyColor: {
                    type: "string"
                },
                grassColor: {
                    type: "string"
                }
            },
            save: function (props) {
                return (
                    <h3>Today the sky is not {props.attributes.skyColor} and the grass is {props.attributes.grassColor}</h3>
                )
            }
        },
        {
            attributes: {
                skyColor: {
                    type: "string"
                },
                grassColor: {
                    type: "string"
                }
            },
            save: function (props) {
                return (
                    <p>Today the sky is {props.attributes.skyColor} and the grass is {props.attributes.grassColor}</p>
                )
            }
        }
    ] */
});

/**
 * Edit component for the block
 * 
 * @param {object} props
 */
function EditComponent(props) {

    // Block properties
    const blockProps = useBlockProps({
        className: "paying-attention-edit-block",
        style: { backgroundColor: props.attributes.bgColor }
    });

    /**
     * Update the question attribute
     * 
     * @param {string} value 
     */
    function updateQuestion(value) {
        props.setAttributes({
            question: value
        });
    }

    /**
     * Delete an answer
     * 
     * @param {number} indexToDelete 
     */
    function deleteAnswer(indexToDelete) {

        // Filter out the answer that was deleted
        const newAnswers = props.attributes.answers.filter(function (answer, index) {
            return index != indexToDelete
        });

        // Update the answers attribute
        props.setAttributes({
            answers: newAnswers
        });

        // If the correct answer was deleted, remove the correct answer
        if (indexToDelete == props.attributes.correctAnswer) {
            props.setAttributes({
                correctAnswer: undefined
            });
        }
    }

    /**
     * Mark an answer as correct
     *
     * @param {number} index
     */
    function markAsCorrect(index) {
        props.setAttributes({
            correctAnswer: index
        });
    }

    return (
        <div {...blockProps} >
            <BlockControls>
                <AlignmentToolbar value={props.attributes.alignment} onChange={alignment => {
                    props.setAttributes({
                        alignment
                    });
                }} />
            </BlockControls>
            <InspectorControls>
                <PanelBody title="Background color" initialOpen={true}>
                    <PanelRow>
                        <ChromePicker color={props.attributes.bgColor} disableAlpha={true} onChangeComplete={color => {
                            props.setAttributes({
                                bgColor: color.hex
                            });
                        }} />
                    </PanelRow>
                </PanelBody>
            </InspectorControls>
            <TextControl
                label="Question:"
                value={props.attributes.question}
                onChange={updateQuestion}
                style={{ fontSize: "20px" }} />
            <p style={{ fontSize: "13px", margin: "20px 0 8px 0" }}>Answers:</p>
            {props.attributes.answers.map((answer, index) => {
                return (
                    <Flex>
                        <FlexBlock>
                            <TextControl value={answer} onChange={newValue => {
                                // Copy the answers array
                                const newAnswers = props.attributes.answers.concat([]);

                                // Update the value of the answer at the current index
                                newAnswers[index] = newValue;

                                // Update the answers attribute
                                props.setAttributes({
                                    answers: newAnswers
                                });
                            }} />
                        </FlexBlock>
                        <FlexItem>
                            <Button>
                                <Icon
                                    onClick={() => markAsCorrect(index)}
                                    className="mark-as-correct"
                                    icon={props.attributes.correctAnswer == index ? "star-filled" : "star-empty"} />
                            </Button>
                        </FlexItem>
                        <FlexItem>
                            <Button variant="link" className="attention-delete" onClick={() => deleteAnswer(index)}>
                                Delete
                            </Button>
                        </FlexItem>
                    </Flex>
                )
            })}
            <Button variant="primary" onClick={() => {
                props.setAttributes({
                    answers: props.attributes.answers.concat([""])
                })
            }}>Add another answer</Button>
        </div>
    )
}