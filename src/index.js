import "./index.scss";
import { TextControl, Flex, FlexBlock, FlexItem, Button, Icon, PanelBody, PanelRow, ColorPicker } from "@wordpress/components";
import { InspectorControls, BlockControls, AlignmentToolbar, useBlockProps } from "@wordpress/block-editor";
import { ChromePicker } from "react-color";

(function () {
    let locked = false;
    wp.data.subscribe(function () {
        const results = wp.data.select("core/block-editor").getBlocks().filter(function (block) {
            return block.name == 'ourplugin/are-you-paying-attention' && block.attributes.correctAnswer == undefined;
        });

        if (results.length && !locked) {
            locked = true;
            wp.data.dispatch("core/editor").lockPostSaving("noanswer");
        }

        if (!results.length && locked) {
            locked = false;
            wp.data.dispatch("core/editor").unlockPostSaving("noanswer");
        }
    });
})()

wp.blocks.registerBlockType("ourplugin/are-you-paying-attention", {
    //title: "Are You Paying Attention?",
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
    } */
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
        }]
});

function EditComponent(props) {

    const blockProps = useBlockProps({
        className: "paying-attention-edit-block",
        style: { backgroundColor: props.attributes.bgColor }
    });

    function updateQuestion(value) {

        props.setAttributes({
            question: value
        });
    }

    function deleteAnswer(indexToDelete) {
        const newAnswers = props.attributes.answers.filter(function (x, index) {
            return index != indexToDelete
        });
        props.setAttributes({
            answers: newAnswers
        });

        if (indexToDelete == props.attributes.correctAnswer) {
            props.setAttributes({
                correctAnswer: undefined
            });
        }
    }

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
                        {/*<ColorPicker color={props.attributes.bgColor} onChangeComplete={color => {
                            props.setAttributes({
                                bgColor: color.hex
                            });
                        }} /> */}
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
                                const newAnswers = props.attributes.answers.concat([]);
                                newAnswers[index] = newValue;
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
            }}>
                Add another answer
            </Button>
        </div >
    )
}